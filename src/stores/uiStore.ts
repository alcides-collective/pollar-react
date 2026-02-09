import { create } from 'zustand';
import { COUNTRY_KEYS } from '../utils/countrySlug';

const STORAGE_KEY = 'pollar-selected-countries';

// --- Storage helpers ---

function readFromStorage(storage: Storage): string[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c: string) => COUNTRY_KEYS.includes(c));
  } catch {
    return [];
  }
}

/** Read persisted countries: sessionStorage first, then localStorage */
function getStoredCountries(): string[] {
  const session = readFromStorage(sessionStorage);
  if (session.length > 0) return session;
  return readFromStorage(localStorage);
}

/** Write to both sessionStorage and localStorage */
function persistCountries(countries: string[]) {
  try {
    if (countries.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const json = JSON.stringify(countries);
      sessionStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(STORAGE_KEY, json);
    }
  } catch { /* storage unavailable */ }
}

/** Static (non-reactive) getter for redirect hook */
export function getPersistedCountries(): string[] {
  return getStoredCountries();
}

// --- Store ---

interface UIState {
  selectedCategory: string | null;
  selectedCountries: string[];
}

interface UIActions {
  setSelectedCategory: (category: string | null) => void;
  setSelectedCountries: (countries: string[]) => void;
  toggleSelectedCountry: (country: string) => void;
  clearSelectedCountries: () => void;
  /** Clear countries from display only (URL has no countries) — storage untouched */
  clearCountriesDisplay: () => void;
  /** Sync from Firestore profile after login */
  syncCountriesFromProfile: (countries: string[] | undefined) => void;
  /** Reset on logout — clears storage + store */
  resetCountries: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  selectedCategory: null,
  selectedCountries: [],

  // Actions
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },
  setSelectedCountries: (countries: string[]) => {
    set({ selectedCountries: countries });
    persistCountries(countries);
  },
  toggleSelectedCountry: (country: string) => {
    const current = get().selectedCountries;
    let next: string[];
    if (current.includes(country)) {
      next = current.filter(c => c !== country);
    } else {
      next = [...current, country];
    }
    set({ selectedCountries: next });
    persistCountries(next);
  },
  clearSelectedCountries: () => {
    set({ selectedCountries: [] });
    persistCountries([]);
  },
  clearCountriesDisplay: () => {
    set({ selectedCountries: [] });
  },
  syncCountriesFromProfile: (countries: string[] | undefined) => {
    const valid = (countries || []).filter(c => COUNTRY_KEYS.includes(c));
    // Firestore is the authority for logged-in users — update localStorage
    try {
      if (valid.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* noop */ }
    set({ selectedCountries: valid });
  },
  resetCountries: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    set({ selectedCountries: [] });
  },
}));

// Convenience hooks
export function useSelectedCategory() {
  return useUIStore((state) => state.selectedCategory);
}

export function useSetSelectedCategory() {
  return useUIStore((state) => state.setSelectedCategory);
}

export function useSelectedCountries() {
  return useUIStore((state) => state.selectedCountries);
}
