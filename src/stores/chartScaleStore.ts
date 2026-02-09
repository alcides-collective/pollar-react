import { create } from 'zustand';

const STORAGE_KEY = 'pollar-chart-smart-scale';

function getStoredSetting(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch { /* localStorage not available */ }
  return false; // Default: smart scale OFF (start from 0)
}

interface ChartScaleState {
  smartScale: boolean;
}

interface ChartScaleActions {
  toggleSmartScale: () => void;
  /** Sync from Firestore profile after login */
  syncFromProfile: (smartScale: boolean | undefined) => void;
  /** Reset to default (on logout) */
  reset: () => void;
}

export const useChartScaleStore = create<ChartScaleState & ChartScaleActions>((set) => ({
  smartScale: getStoredSetting(),

  toggleSmartScale: () => {
    set((state) => {
      const next = !state.smartScale;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch { /* noop */ }
      return { smartScale: next };
    });
  },

  syncFromProfile: (smartScale) => {
    if (smartScale === undefined) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(smartScale));
    } catch { /* noop */ }
    set({ smartScale });
  },

  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    set({ smartScale: false });
  },
}));

export function useSmartScale(): boolean {
  return useChartScaleStore((s) => s.smartScale);
}

export function useToggleSmartScale() {
  return useChartScaleStore((s) => s.toggleSmartScale);
}
