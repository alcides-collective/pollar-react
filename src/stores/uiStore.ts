import { create } from 'zustand';

interface UIState {
  selectedCategory: string | null;
}

interface UIActions {
  setSelectedCategory: (category: string | null) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // State
  selectedCategory: null,

  // Actions
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },
}));

// Convenience hooks
export function useSelectedCategory() {
  return useUIStore((state) => state.selectedCategory);
}

export function useSetSelectedCategory() {
  return useUIStore((state) => state.setSelectedCategory);
}
