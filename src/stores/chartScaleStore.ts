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
}

export const useChartScaleStore = create<ChartScaleState & ChartScaleActions>((set, get) => ({
  smartScale: getStoredSetting(),

  toggleSmartScale: () => {
    const next = !get().smartScale;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch { /* noop */ }
    set({ smartScale: next });
  },
}));

export function useSmartScale(): boolean {
  return useChartScaleStore((s) => s.smartScale);
}

export function useToggleSmartScale() {
  return useChartScaleStore((s) => s.toggleSmartScale);
}
