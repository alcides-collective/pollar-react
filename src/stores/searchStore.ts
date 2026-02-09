import { create } from 'zustand';
import type { SearchResult, PopularSearch, SearchResponse } from '../types/search';
import { API_BASE } from '../config/api';
import { trackSearchPerformed } from '../lib/analytics';

interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  popularSearches: PopularSearch[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

interface SearchActions {
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  fetchPopularSearches: () => Promise<void>;
  clearSearch: () => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>((set, get) => ({
  // State
  isOpen: false,
  query: '',
  results: [],
  popularSearches: [],
  suggestions: [],
  isLoading: false,
  error: null,

  // Actions
  openSearch: () => {
    set({ isOpen: true });
    // Fetch popular searches when opening
    get().fetchPopularSearches();
  },

  closeSearch: () => {
    set({ isOpen: false });
  },

  setQuery: (query: string) => {
    set({ query });
  },

  search: async (query: string) => {
    if (query.length < 3) {
      set({ results: [], suggestions: [] });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=20`
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data: SearchResponse = await response.json();

      set({
        results: data.results,
        suggestions: data.suggestions || [],
        isLoading: false,
      });

      // Track search performed for analytics
      trackSearchPerformed({ query, results_count: data.results.length });
    } catch (error) {
      set({
        error: 'Wyszukiwanie nie powiodło się',
        isLoading: false,
        results: [],
      });
    }
  },

  fetchPopularSearches: async () => {
    try {
      const response = await fetch(`${API_BASE}/search/popular`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      set({ popularSearches: data.popularSearches || [] });
    } catch {
      // Silently fail - popular searches are not critical
    }
  },

  clearSearch: () => {
    set({
      query: '',
      results: [],
      suggestions: [],
      error: null,
    });
  },
}));

// Convenience hooks
export function useSearchOpen() {
  return useSearchStore((state) => state.isOpen);
}

export function useSearchQuery() {
  return useSearchStore((state) => state.query);
}

export function useSearchResults() {
  return useSearchStore((state) => state.results);
}

export function useSearchLoading() {
  return useSearchStore((state) => state.isLoading);
}
