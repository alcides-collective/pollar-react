import { create } from 'zustand';

interface UIState {
  selectedCategory: string | null;
  selectedCountries: string[];
}

interface UIActions {
  setSelectedCategory: (category: string | null) => void;
  setSelectedCountries: (countries: string[]) => void;
  toggleSelectedCountry: (country: string) => void;
  clearSelectedCountries: () => void;
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
  },
  toggleSelectedCountry: (country: string) => {
    const current = get().selectedCountries;
    if (current.includes(country)) {
      set({ selectedCountries: current.filter(c => c !== country) });
    } else {
      set({ selectedCountries: [...current, country] });
    }
  },
  clearSelectedCountries: () => {
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
