import { create } from 'zustand';
import type { WatchlistItem } from '../types/gielda';

// Watchlist store with localStorage persistence
interface WatchlistState {
  items: WatchlistItem[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
  clear: () => void;
}

const STORAGE_KEY = 'stock-watchlist';

function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistWatchlist(items: WatchlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: getStoredWatchlist(),

  add: (symbol: string) => {
    set(state => {
      if (state.items.some(i => i.symbol === symbol)) return state;
      const newItems = [...state.items, { symbol, addedAt: Date.now() }];
      persistWatchlist(newItems);
      return { items: newItems };
    });
  },

  remove: (symbol: string) => {
    set(state => {
      const newItems = state.items.filter(i => i.symbol !== symbol);
      persistWatchlist(newItems);
      return { items: newItems };
    });
  },

  toggle: (symbol: string) => {
    set(state => {
      const exists = state.items.some(i => i.symbol === symbol);
      const newItems = exists
        ? state.items.filter(i => i.symbol !== symbol)
        : [...state.items, { symbol, addedAt: Date.now() }];
      persistWatchlist(newItems);
      return { items: newItems };
    });
  },

  has: (symbol: string): boolean => {
    return get().items.some(i => i.symbol === symbol);
  },

  clear: () => {
    set({ items: [] });
    persistWatchlist([]);
  },
}));

// UI state for gielda section
interface GieldaUIState {
  selectedRange: string;
  setSelectedRange: (range: string) => void;
}

export const useGieldaUIStore = create<GieldaUIState>((set) => ({
  selectedRange: '1mo',
  setSelectedRange: (range: string) => set({ selectedRange: range }),
}));
