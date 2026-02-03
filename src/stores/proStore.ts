import { create } from 'zustand';

interface ProStore {
  isProModalOpen: boolean;
  openProModal: () => void;
  closeProModal: () => void;
}

export const useProStore = create<ProStore>((set) => ({
  isProModalOpen: false,
  openProModal: () => set({ isProModalOpen: true }),
  closeProModal: () => set({ isProModalOpen: false }),
}));
