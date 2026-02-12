import { create } from 'zustand';
import { trackCookieConsent } from '@/lib/analytics';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Google Consent Mode v2 helper
function updateGoogleConsent(consent: CookieConsent) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.marketing ? 'granted' : 'denied',
    });
  }
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
    updateGoogleConsent(consent);
    trackCookieConsent({ analytics_accepted: true, marketing_accepted: true });
    set({ consent, hasInteracted: true });
  },

  rejectOptional: () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveToStorage(consent);
    updateGoogleConsent(consent);
    trackCookieConsent({ analytics_accepted: false, marketing_accepted: false });
    set({ consent, hasInteracted: true });
  },

  setConsent: (consent: CookieConsent) => {
    saveToStorage(consent);
    updateGoogleConsent(consent);
    trackCookieConsent({ analytics_accepted: consent.analytics, marketing_accepted: consent.marketing });
    set({ consent, hasInteracted: true });
  },

  loadFromStorage: () => {
    const { consent, hasInteracted } = loadFromStorageSync();
    if (consent) {
      updateGoogleConsent(consent);
    }
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
