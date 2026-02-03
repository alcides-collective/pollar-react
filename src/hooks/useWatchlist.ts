import { useState, useEffect, useCallback } from 'react';
import type { WatchlistItem } from '../types/gielda';

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

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getStoredWatchlist());

  // Sync with localStorage on mount
  useEffect(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  const add = useCallback((symbol: string) => {
    setWatchlist(items => {
      if (items.some(i => i.symbol === symbol)) return items;
      const newItems = [...items, { symbol, addedAt: Date.now() }];
      persistWatchlist(newItems);
      return newItems;
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setWatchlist(items => {
      const newItems = items.filter(i => i.symbol !== symbol);
      persistWatchlist(newItems);
      return newItems;
    });
  }, []);

  const toggle = useCallback((symbol: string) => {
    setWatchlist(items => {
      const exists = items.some(i => i.symbol === symbol);
      const newItems = exists
        ? items.filter(i => i.symbol !== symbol)
        : [...items, { symbol, addedAt: Date.now() }];
      persistWatchlist(newItems);
      return newItems;
    });
  }, []);

  const has = useCallback((symbol: string): boolean => {
    return watchlist.some(i => i.symbol === symbol);
  }, [watchlist]);

  const clear = useCallback(() => {
    setWatchlist([]);
    persistWatchlist([]);
  }, []);

  return {
    watchlist,
    add,
    remove,
    toggle,
    has,
    clear,
    symbols: watchlist.map(w => w.symbol),
  };
}
