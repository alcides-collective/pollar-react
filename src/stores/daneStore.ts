import { create } from 'zustand';

interface DaneUIState {
  // Air quality filters
  selectedProvince: string | null;

  // Names filters
  namesYear: number | null;
  namesGender: 'M' | 'K' | null;

  // Eurostat
  selectedIndicator: string;
  selectedCountries: string[];
}

interface DaneUIActions {
  setSelectedProvince: (province: string | null) => void;
  setNamesYear: (year: number | null) => void;
  setNamesGender: (gender: 'M' | 'K' | null) => void;
  setSelectedIndicator: (indicator: string) => void;
  setSelectedCountries: (countries: string[]) => void;
  resetFilters: () => void;
}

type DaneStore = DaneUIState & DaneUIActions;

const initialState: DaneUIState = {
  selectedProvince: null,
  namesYear: null,
  namesGender: null,
  selectedIndicator: 'gdp',
  selectedCountries: ['PL', 'DE', 'CZ', 'SK'],
};

export const useDaneStore = create<DaneStore>((set) => ({
  ...initialState,

  setSelectedProvince: (province) => set({ selectedProvince: province }),
  setNamesYear: (year) => set({ namesYear: year }),
  setNamesGender: (gender) => set({ namesGender: gender }),
  setSelectedIndicator: (indicator) => set({ selectedIndicator: indicator }),
  setSelectedCountries: (countries) => set({ selectedCountries: countries }),
  resetFilters: () => set(initialState),
}));

// Selectors
export const useSelectedProvince = () => useDaneStore((state) => state.selectedProvince);
export const useNamesFilters = () => useDaneStore((state) => ({
  year: state.namesYear,
  gender: state.namesGender,
}));
