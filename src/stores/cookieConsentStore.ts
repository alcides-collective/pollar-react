import { create } from 'zustand';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentState {
  consent: CookieConsent | null;
  hasInteracted: boolean;
}

interface CookieConsentActions {
  acceptAll: () => void;
  rejectOptional: () => void;
  setConsent: (consent: CookieConsent) => void;
  loadFromStorage: () => void;
}

type CookieConsentStore = CookieConsentState & CookieConsentActions;

const STORAGE_KEY = 'cookie-consent';

function saveToStorage(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {}
}

function loadFromStorageSync(): { consent: CookieConsent | null; hasInteracted: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { consent: JSON.parse(stored), hasInteracted: true };
    }
  } catch {}
  return { consent: null, hasInteracted: false };
}

export const useCookieConsentStore = create<CookieConsentStore>((set) => ({
  consent: null,
  hasInteracted: false,

  acceptAll: () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveToStorage(consent);
    set({ consent, hasInteracted: true });
  },

  rejectOptional: () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveToStorage(consent);
    set({ consent, hasInteracted: true });
  },

  setConsent: (consent: CookieConsent) => {
    saveToStorage(consent);
    set({ consent, hasInteracted: true });
  },

  loadFromStorage: () => {
    const { consent, hasInteracted } = loadFromStorageSync();
    set({ consent, hasInteracted });
  },
}));

// Convenience hooks
export function useCookieConsent() {
  return useCookieConsentStore((state) => state.consent);
}

export function useHasCookieConsent() {
  return useCookieConsentStore((state) => state.hasInteracted);
}
