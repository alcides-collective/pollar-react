import { create } from 'zustand';
import type { ThemePreference } from '@/types/auth';
import { trackThemeChanged } from '@/lib/analytics';

export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'pollar-theme';

function getStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemePreference;
    }
  } catch {
    /* localStorage not available */
  }
  return 'light';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

interface ThemeState {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
}

interface ThemeActions {
  setPreference: (pref: ThemePreference) => void;
  /** Called when system theme changes (mediaQuery listener) */
  _onSystemThemeChange: () => void;
  /** Sync from Firestore profile after login */
  syncFromProfile: (pref: ThemePreference | undefined) => void;
  /** Reset to light mode (on logout) */
  reset: () => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  preference: getStoredTheme(),
  resolvedTheme: resolveTheme(getStoredTheme()),

  setPreference: (pref) => {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* noop */
    }
    trackThemeChanged({ theme: pref });
    set({ preference: pref, resolvedTheme: resolveTheme(pref) });
  },

  _onSystemThemeChange: () => {
    const { preference } = get();
    if (preference === 'system') {
      set({ resolvedTheme: getSystemTheme() });
    }
  },

  syncFromProfile: (pref) => {
    if (!pref) return;
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* noop */
    }
    set({ preference: pref, resolvedTheme: resolveTheme(pref) });
  },

  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    set({ preference: 'light', resolvedTheme: 'light' });
  },
}));

// Convenience hooks
export function useThemePreference(): ThemePreference {
  return useThemeStore((s) => s.preference);
}

export function useResolvedTheme(): ResolvedTheme {
  return useThemeStore((s) => s.resolvedTheme);
}

export function useSetThemePreference() {
  return useThemeStore((s) => s.setPreference);
}

export function useIsDarkMode(): boolean {
  return useThemeStore((s) => s.resolvedTheme === 'dark');
}
