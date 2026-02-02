import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';
import type { SearchResult } from '../types/search';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const debounceTimerRef = useRef<number | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle query change with debounce
  const handleQueryChange = useCallback(
    (query: string) => {
      store.setQuery(query);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced search
      if (query.length >= 3) {
        debounceTimerRef.current = window.setTimeout(() => {
          store.search(query);
        }, DEBOUNCE_MS);
      } else {
        // Clear results for short queries
        store.clearSearch();
        store.setQuery(query);
      }
    },
    [store]
  );

  // Handle result selection - close modal and navigate
  const handleSelect = useCallback(
    (result: SearchResult) => {
      store.closeSearch();
      store.clearSearch();
      navigate(result.url);
    },
    [store, navigate]
  );

  // Handle popular search selection
  const handlePopularSearch = useCallback(
    (term: string) => {
      store.setQuery(term);
      store.search(term);
    },
    [store]
  );

  // Handle suggestion selection
  const handleSuggestion = useCallback(
    (suggestion: string) => {
      store.setQuery(suggestion);
      store.search(suggestion);
    },
    [store]
  );

  return {
    // State
    isOpen: store.isOpen,
    query: store.query,
    results: store.results,
    popularSearches: store.popularSearches,
    suggestions: store.suggestions,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    openSearch: store.openSearch,
    closeSearch: store.closeSearch,
    handleQueryChange,
    handleSelect,
    handlePopularSearch,
    handleSuggestion,
    clearSearch: store.clearSearch,
  };
}
